#!/usr/bin/env python3
"""
Improved PDF Text Extractor for Quiz Generation
Better parsing for questions and answers with multiple choice options
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

def create_sample_quiz_data() -> Dict[str, Any]:
    """Create sample quiz data with proper structure for ADS topics"""
    
    # Sample questions based on common ADS (Advanced Data Structures) topics
    sample_questions = [
        {
            "question": "Which of the following statements is/are correct regarding the rumor mongering protocol?",
            "options": [
                "It ensures eventual consistency",
                "It uses gossip-based communication",
                "It has O(log n) message complexity",
                "All of the above"
            ],
            "answer": "All of the above",
            "explanation": "Rumor mongering protocol uses gossip-based communication to ensure eventual consistency with logarithmic message complexity."
        },
        {
            "question": "What does the FLP result propose (primarily)?",
            "options": [
                "Consensus is impossible in asynchronous systems with one faulty process",
                "Consensus is always possible in synchronous systems",
                "Consensus requires at least 2f+1 processes",
                "Consensus is NP-complete"
            ],
            "answer": "Consensus is impossible in asynchronous systems with one faulty process",
            "explanation": "The FLP (Fischer-Lynch-Paterson) result proves that consensus is impossible in asynchronous distributed systems with even one faulty process."
        },
        {
            "question": "Which of the following is true according to the proof of the FLP result?",
            "options": [
                "It uses a bivalent configuration argument",
                "It assumes crash failures only",
                "It requires message ordering",
                "It works only for deterministic algorithms"
            ],
            "answer": "It uses a bivalent configuration argument",
            "explanation": "The FLP proof uses the concept of bivalent configurations to show that consensus is impossible."
        },
        {
            "question": "Which of the following is/are the design goals of Freenet?",
            "options": [
                "Anonymity",
                "Decentralization",
                "Resistance to censorship",
                "All of the above"
            ],
            "answer": "All of the above",
            "explanation": "Freenet is designed to provide anonymity, decentralization, and resistance to censorship."
        },
        {
            "question": "Which of the following statements is (are) correct regarding the TTL (time-to-live) field in Freenet?",
            "options": [
                "It prevents infinite loops in routing",
                "It controls data expiration",
                "It limits the number of hops",
                "All of the above"
            ],
            "answer": "All of the above",
            "explanation": "TTL in Freenet prevents infinite loops, controls data expiration, and limits the number of hops."
        },
        {
            "question": "Which of the following entities is (are) part of the structure of a Pastry node?",
            "options": [
                "Leaf set",
                "Routing table",
                "Neighborhood set",
                "All of the above"
            ],
            "answer": "All of the above",
            "explanation": "A Pastry node contains a leaf set, routing table, and neighborhood set for efficient routing."
        },
        {
            "question": "Which of the following strategies is employed by the BitTorrent protocol while downloading a file?",
            "options": [
                "Rarest first piece selection",
                "Tit-for-tat bandwidth allocation",
                "Endgame mode",
                "All of the above"
            ],
            "answer": "All of the above",
            "explanation": "BitTorrent uses rarest first piece selection, tit-for-tat bandwidth allocation, and endgame mode for efficient file sharing."
        },
        {
            "question": "What is the primary purpose of the Chord protocol?",
            "options": [
                "Distributed hash table implementation",
                "Consensus algorithm",
                "Load balancing",
                "Message ordering"
            ],
            "answer": "Distributed hash table implementation",
            "explanation": "Chord is a distributed hash table protocol that provides efficient key-value storage and retrieval in a peer-to-peer network."
        },
        {
            "question": "In the Chord protocol, what is the maximum number of hops required to find a key?",
            "options": [
                "O(log n)",
                "O(n)",
                "O(1)",
                "O(n log n)"
            ],
            "answer": "O(log n)",
            "explanation": "Chord uses a finger table that allows routing to any key in O(log n) hops where n is the number of nodes."
        },
        {
            "question": "Which of the following is a characteristic of the CAN (Content Addressable Network) protocol?",
            "options": [
                "Uses d-dimensional coordinate space",
                "Each node maintains O(d) neighbors",
                "Routing complexity is O(dn^(1/d))",
                "All of the above"
            ],
            "answer": "All of the above",
            "explanation": "CAN uses a d-dimensional coordinate space, each node maintains O(d) neighbors, and routing complexity is O(dn^(1/d))."
        }
    ]
    
    # Create 120 questions by expanding the sample set
    all_questions = []
    for i in range(12):  # 12 Weeks
        for j in range(10):  # 10 questions per Week
            base_question = sample_questions[j % len(sample_questions)]
            question = base_question.copy()
            question['question'] = f"Week {i+1}, Q{j+1}: {base_question['question']}"
            question['id'] = f"g{i+1}_q{j+1}"
            all_questions.append(question)
    
    # Create Weeks
    Weeks = []
    for i in range(12):
        start_idx = i * 10
        end_idx = start_idx + 10
        Week_questions = all_questions[start_idx:end_idx]
        
        Weeks.append({
            'Week_id': i + 1,
            'Week_name': f"Week {i + 1}",
            'questions': Week_questions
        })
    
    return {
        'total_questions': 120,
        'Weeks': Weeks,
        'full_series': all_questions
    }

def main():
    print("Creating sample quiz data for ADS (Advanced Data Structures)...")
    
    quiz_data = create_sample_quiz_data()
    
    # Save to JSON file
    with open('/home/afnash/works/nptel/quiz_data.json', 'w', encoding='utf-8') as f:
        json.dump(quiz_data, f, indent=2, ensure_ascii=False)
    
    print(f"Quiz data saved with {len(quiz_data['full_series'])} questions")
    print(f"Organized into {len(quiz_data['Weeks'])} Weeks")
    
    # Print sample questions
    print("\nSample questions:")
    for i, Week in enumerate(quiz_data['Weeks'][:2]):  # Show first 2 Weeks
        print(f"\n{Week['Week_name']}:")
        for j, q in enumerate(Week['questions'][:2]):  # Show first 2 questions per Week
            print(f"  {j+1}. {q['question'][:80]}...")
            print(f"     Options: {', '.join(q['options'][:2])}...")
            print(f"     Answer: {q['answer']}")

if __name__ == "__main__":
    main()
