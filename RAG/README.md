# Building the RAG

All the content in this folder is unnecessary for running the project. It contains only the components needed to build the RAG (*Retrieval-Augmented Generation*) used in the project from scratch. If you wish to reproduce the steps, the execution order is as follows:

1. The notebook `civitai.ipynb` contains the scraping routines to extract the prompts from the website https://civitai.com/ and save it as a JSON file.
2. Once the JSON is created, the notebook `rag.ipynb` is used to generate the embedding matrix from the prompt contained in the JSON file. This notebook also includes a function for testing examples.
3. The final result of all this work is the `embeddings.npy` file, which is also included in the production backend.
