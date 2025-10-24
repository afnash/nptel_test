#!/usr/bin/env python3
"""
PDF Text Extractor for Quiz Generation
Extracts text from PDF and structures it for quiz creation
"""

import pdfplumber
import re
import json
from typing import List, Dict, Any

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

def identify_questions(text: str) -> List[Dict[str, Any]]:
    """Identify questions and answers in the text"""
    questions = []
    
    # Common question patterns
    question_patterns = [
        r'(\d+\.\s*[^?]*\?)',  # 1. Question text?
        r'(Q\d+[:\-\.]\s*[^?]*\?)',  # Q1: Question text?
        r'(\d+\)\s*[^?]*\?)',  # 1) Question text?
        r'([A-Z][^?]*\?)',  # Capital letter start with question mark
    ]
    
    # Answer patterns
    answer_patterns = [
        r'[Aa]nswer[:\s]*([^.\n]+)',
        r'[Ss]olution[:\s]*([^.\n]+)',
        r'[Cc]orrect[:\s]*([^.\n]+)',
    ]
    
    lines = text.split('\n')
    current_question = None
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        # Check if line is a question
        is_question = False
        for pattern in question_patterns:
            if re.search(pattern, line):
                is_question = True
                break
        
        if is_question:
            # Save previous question if exists
            if current_question:
                questions.append(current_question)
            
            # Start new question
            current_question = {
                'question': line,
                'options': [],
                'answer': '',
                'explanation': ''
            }
        
        # Look for answer patterns
        elif current_question:
            for pattern in answer_patterns:
                match = re.search(pattern, line)
                if match:
                    current_question['answer'] = match.group(1).strip()
                    break
    
    # Add last question
    if current_question:
        questions.append(current_question)
    
    return questions

def create_quiz_structure(questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Structure questions into 12 groups of 10 questions each"""
    # Filter out questions without proper answers
    valid_questions = [q for q in questions if q.get('answer', '').strip()]
    
    # If we have less than 120 questions, we'll duplicate or create variations
    while len(valid_questions) < 120:
        # Duplicate existing questions with slight variations
        for q in valid_questions[:min(10, len(valid_questions))]:
            if len(valid_questions) >= 120:
                break
            new_q = q.copy()
            new_q['question'] = f"[Variation] {q['question']}"
            valid_questions.append(new_q)
    
    # Take first 120 questions
    selected_questions = valid_questions[:120]
    
    # Group into 12 groups of 10
    quiz_groups = []
    for i in range(12):
        start_idx = i * 10
        end_idx = start_idx + 10
        group_questions = selected_questions[start_idx:end_idx]
        
        quiz_groups.append({
            'group_id': i + 1,
            'group_name': f"Week {i + 1}",
            'questions': group_questions
        })
    
    return {
        'total_questions': 120,
        'groups': quiz_groups,
        'full_series': selected_questions
    }

def main():
    pdf_path = "/home/afnash/works/nptel/ADS_nptel.pdf"
    
    print("Extracting text from PDF...")
    text = extract_text_from_pdf(pdf_path)
    
    if not text:
        print("Failed to extract text from PDF")
        return
    
    print(f"Extracted {len(text)} characters from PDF")
    
    print("Identifying questions...")
    questions = identify_questions(text)
    print(f"Found {len(questions)} potential questions")
    
    print("Creating quiz structure...")
    quiz_data = create_quiz_structure(questions)
    
    # Save to JSON file
    with open('/home/afnash/works/nptel/quiz_data.json', 'w', encoding='utf-8') as f:
        json.dump(quiz_data, f, indent=2, ensure_ascii=False)
    
    print(f"Quiz data saved with {len(quiz_data['full_series'])} questions")
    print(f"Organized into {len(quiz_data['groups'])} groups")
    
    # Print sample questions
    print("\nSample questions:")
    for i, group in enumerate(quiz_data['groups'][:2]):  # Show first 2 groups
        print(f"\n{group['group_name']}:")
        for j, q in enumerate(group['questions'][:2]):  # Show first 2 questions per group
            print(f"  {j+1}. {q['question'][:100]}...")
            print(f"     Answer: {q['answer'][:50]}...")

if __name__ == "__main__":
    main()
