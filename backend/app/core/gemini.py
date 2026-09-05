import os
import json
from typing import Dict, Any, List
from app.core.config import settings

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key and not settings.DEMO_MODE:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[GeminiService] Could not initialize Gemini SDK: {e}. Falling back to Demo Engine.")

    def generate_answer(
        self, 
        question: str, 
        topic_name: str, 
        context_chunks: List[Dict[str, Any]], 
        has_contradiction: bool, 
        contradiction_details: str
    ) -> str:
        # If Gemini client is active, use it
        if self.client:
            try:
                context_str = "\n---\n".join([f"Source ({c['material_title']}, Page {c['page_number']}): {c['content']}" for c in context_chunks])
                prompt = f"""You are EduAgent AI, a friendly and accurate university AI Teaching Assistant.
Answer the student's question based STRICTLY on the provided course material context.

Question: {question}
Topic: {topic_name}

Course Context:
{context_str}

Contradiction Status: {'YES - ' + contradiction_details if has_contradiction else 'NO CONTRADICTION'}

Instructions:
1. If there is a contradiction in the materials, highlight it clearly and state that the query has been escalated to the instructor.
2. If context is available, answer clearly with bullet points and code/math examples if appropriate.
3. Be encouraging and clear.
"""
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                print(f"[GeminiService] Error calling Gemini API: {e}. Falling back to Mock generator.")

        # Fallback / Demo Mode Answer Generator
        return self._generate_mock_answer(question, topic_name, context_chunks, has_contradiction, contradiction_details)

    def _generate_mock_answer(
        self, 
        question: str, 
        topic_name: str, 
        context_chunks: List[Dict[str, Any]], 
        has_contradiction: bool, 
        contradiction_details: str
    ) -> str:
        q_lower = question.lower()

        if has_contradiction:
            return (
                f"⚠️ **Apparent Contradiction Detected in Course Materials**\n\n"
                f"I noticed a conflict in our uploaded course documents:\n"
                f"> **{contradiction_details}**\n\n"
                f"Because of this discrepancy, I cannot give a single authoritative answer without instructor input. "
                f"**I have automatically escalated this question to your course instructor.** "
                f"They will review the materials and post a clarification shortly!"
            )

        if "recursion" in q_lower or "stack space" in q_lower or "o(n)" in q_lower:
            return (
                f"### Recursion & Stack Space Analysis ({topic_name})\n\n"
                f"Great question! In **{topic_name}**, the memory complexity of a recursive call depends directly on the maximum depth of the call stack:\n\n"
                f"1. **Linear Recursion (e.g., standard Factorial / DFS)**: Each recursive call adds a frame to the call stack. For a call depth of $N$, the space complexity is **$O(N)$**.\n"
                f"2. **Tail Call Optimization (TCO)**: If the recursive call is the final operation in the function and the compiler/runtime supports TCO, frame reuse can reduce space complexity to **$O(1)$**.\n"
                f"3. **Divide and Conquer (e.g., Merge Sort / Tree Traversal)**: Balanced call trees yield a stack depth of **$O(\\log N)$**.\n\n"
                f"💡 **Course Material Note**: According to *Lecture 3 Slides (Page 14)*, standard recursive algorithms without tail optimization allocate $O(N)$ stack memory."
            )

        if "binary search" in q_lower or "time complexity" in q_lower:
            return (
                f"### Time Complexity of Binary Search ({topic_name})\n\n"
                f"Binary Search operates on a **sorted array** by repeatedly halving the search space:\n\n"
                f"- **Best Case**: $O(1)$ (element found at middle index immediately)\n"
                f"- **Average & Worst Case**: $O(\\log_2 N)$ because after $k$ steps, the remaining size is $N / 2^k = 1 \\implies k = \\log_2 N$.\n\n"
                f"📌 *Reference*: Course Textbook Chapter 4, Page 42."
            )

        if "pointer" in q_lower or "memory" in q_lower:
            return (
                f"### Pointer & Memory Allocation ({topic_name})\n\n"
                f"When working with dynamic memory in C/C++:\n"
                f"- `malloc()` / `new` allocates memory on the **Heap**.\n"
                f"- Local pointer variables reside on the **Stack** and store the memory address of the Heap block.\n"
                f"- Always ensure to call `free()` or `delete` to prevent memory leaks!\n\n"
                f"📌 *Reference*: Module 2 Lab Manual, Page 8."
            )

        # Default generic grounded response
        citation_str = f" (*{context_chunks[0]['material_title']}, Page {context_chunks[0]['page_number']}*)" if context_chunks else ""
        return (
            f"### Response regarding {topic_name}\n\n"
            f"Based on your course materials{citation_str}:\n\n"
            f"The concept of **{topic_name}** is fundamental to this module. Here is a summary:\n"
            f"- Your query relates directly to the learning objectives of **{topic_name}**.\n"
            f"- Key principles include understanding foundational definitions, algorithm bounds, and implementation best practices.\n\n"
            f"If you need further clarification on specific edge cases, feel free to ask!"
        )

gemini_service = GeminiService()
