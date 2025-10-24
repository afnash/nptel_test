#!/usr/bin/env python3
"""
Improved PDF Text Extractor for Quiz Generation
Better parsing for questions and answers with multiple choice options
"""

import pdfplumber
import re
import json
from typing import List, Dict, Any
from pathlib import Path

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text content from PDF file"""
    try:
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""

def load_all_questions():
    # Read and clean all_q.json to remove comments and trailing commas
    with open('all_q.json', 'r', encoding='utf-8') as f:
        raw = f.read()
    # Remove lines starting with //
    raw = re.sub(r'^//.*$', '', raw, flags=re.MULTILINE)
    # Remove [cite_start] and [cite: ...] patterns
    raw = re.sub(r'\[cite_start\]', '', raw)
    raw = re.sub(r'\[cite:.*?\]', '', raw)
    # Remove trailing commas before closing brackets/braces
    raw = re.sub(r',\s*([}\]])', r'\1', raw)
    # Fix invalid escape sequences
    raw = re.sub(r'\\([^"\\/bfnrtu])', r'\\\\\1', raw)
    all_q = json.loads(raw)
    questions = [q for q in all_q if 'question' in q]
    return questions

def build_quiz_data():
    questions = load_all_questions()
    # Only take the first 120 questions
    selected_questions = questions[:120]
    # Divide into 12 weeks
    Weeks = []
    for i in range(12):
        start_idx = i * 10
        end_idx = start_idx + 10
        week_questions = selected_questions[start_idx:end_idx]
        # Add week and question IDs
        for j, q in enumerate(week_questions):
            q = q.copy()
            q['id'] = f"w{i+1}_q{j+1}"
            q['question'] = f"Week {i+1}, Q{j+1}: {q['question']}"
            week_questions[j] = q
        Weeks.append({
            'Week_id': i + 1,
            'Week_name': f"Week {i + 1}",
            'questions': week_questions
        })
    quiz_data = {
        'total_questions': len(selected_questions),
        'Weeks': Weeks,
        'full_series': selected_questions
    }
    with open('quiz_data.json', 'w', encoding='utf-8') as f:
        json.dump(quiz_data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    build_quiz_data()
