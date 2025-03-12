import requests
import json
import re 
import time 


papers = [
  {
    "id": "paper1",
    "title": "Deep Learning Approaches for Natural Language Processing",
    "abstract": "This paper explores the application of deep learning models, including recurrent neural networks and transformers, in solving various natural language processing tasks such as text classification, sentiment analysis, and machine translation."
  },
  {
    "id": "paper2",
    "title": "Graph Neural Networks: Methods and Applications",
    "abstract": "Graph Neural Networks (GNNs) have emerged as a powerful tool for learning on graph-structured data. This paper reviews the core methodologies of GNNs and discusses their applications in social networks, knowledge graphs, and biological networks."
  },
  {
    "id": "paper3",
    "title": "A Survey on Reinforcement Learning Techniques for Robotics",
    "abstract": "Reinforcement Learning (RL) has been successfully applied to a range of robotic control tasks. This paper surveys different RL algorithms, including policy gradients and Q-learning, and their implementation challenges in real-world robotic systems."
  },
  {
    "id": "paper4",
    "title": "Explainable AI: Interpreting Black-Box Machine Learning Models",
    "abstract": "As machine learning models grow in complexity, the need for interpretability increases. This work provides an overview of explainable AI methods, including SHAP values and LIME, to interpret black-box models in domains such as healthcare and finance."
  },
  {
    "id": "paper5",
    "title": "Transfer Learning for Image Classification with Convolutional Neural Networks",
    "abstract": "Transfer learning enables the use of pre-trained convolutional neural networks (CNNs) for image classification tasks with limited data. This paper discusses various transfer learning strategies and evaluates their performance on benchmark datasets."
  },
  {
    "id": "paper6",
    "title": "Federated Learning: Privacy-Preserving Machine Learning at Scale",
    "abstract": "Federated learning allows machine learning models to be trained across multiple decentralized devices without sharing raw data. This paper explores the challenges and solutions for implementing federated learning in real-world scenarios such as mobile devices and healthcare."
  },
  {
    "id": "paper7",
    "title": "Knowledge Graph Embeddings: Techniques and Applications",
    "abstract": "Knowledge graph embeddings aim to encode entities and relations from knowledge graphs into continuous vector spaces. This paper reviews different embedding techniques and highlights their applications in recommendation systems and question answering."
  },
  {
    "id": "paper8",
    "title": "BERT and Beyond: Recent Advances in Pre-trained Language Models",
    "abstract": "Pre-trained language models like BERT have revolutionized NLP tasks. This paper surveys the evolution of these models, including RoBERTa, GPT, and T5, and their fine-tuning for downstream tasks such as reading comprehension and summarization."
  },
  {
    "id": "paper9",
    "title": "Adversarial Attacks and Defenses in Deep Learning",
    "abstract": "Deep learning models are vulnerable to adversarial attacks. This paper reviews common attack methods, such as FGSM and PGD, and various defense strategies to improve model robustness in security-critical applications."
  },
  {
    "id": "paper10",
    "title": "Meta-Learning for Few-Shot Learning Problems",
    "abstract": "Meta-learning, or learning to learn, aims to address few-shot learning challenges by enabling models to rapidly adapt to new tasks. This paper reviews model-agnostic meta-learning (MAML) and other algorithms that improve performance in low-data regimes."
  }
]



def generate_topics(papers, model="mistral", batch_size=3):
    topics = {}
    for i in range(0, len(papers), batch_size):
        batch = papers[i:i+batch_size]
        prompt = "Given the following papers, extract 2-3 key research topics for each paper.\n\n"
        for idx, paper in enumerate(batch, 1):
            prompt += f"Paper {idx}:\nTitle: {paper['title']}\nAbstract: {paper['abstract']}\n\n"
        prompt += "Respond in format:\n"
        for idx in range(1, len(batch) + 1):
            prompt += f"Paper {idx} Topics: [topic1, topic2, topic3]\n"

        print("Prompt:", prompt)

        response = requests.post("http://localhost:11434/api/generate", json={
            "model": model,
            "prompt": prompt,
            "stream": False
        })
        result = response.json()["response"]
        # Simple parsing (can improve with regex/JSON format if model supports)
        for idx, paper in enumerate(batch, 1):
            match = re.search(f"Paper {idx} Topics: \\[(.*?)\\]", result)
            if match:
                topics[paper['id']] = [t.strip() for t in match.group(1).split(",")]
    return topics

start_time = time.time()
print(generate_topics(papers=papers))
end_time = time.time()
print('Total time:', end_time- start_time)