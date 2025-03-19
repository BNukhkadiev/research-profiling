# LLM Server Connection & Setup Guide
## Connecting to the LLM Server

### Step 1: Connect to the University VPN  
To access the LLM server, connect to the **University of Mannheim VPN** using **Cisco AnyConnect** or another VPN client.

### Step 2: Connect to Cervantes Machine  
Once connected to the VPN, use SSH to connect to the **Cervantes** machine in the lab:

```sh
ssh username@134.155.86.170
```

### LLM Setup
Model & Hosting
The LLM is hosted via Ollama, running two instances for better performance. If necessary, a third CPU-only instance can be spawned, though it is not an ideal solution due to performance limitations.

Step 1: Install Ollama & Download the Model
On the Cervantes machine, install the required model:


```sh
ollama pull mistral
Step 2: Set Up SSH Tunneling
To access the LLM service from your local machine, create SSH tunnels:
```


```sh
ssh -L 11434:localhost:11434 username@134.155.86.170
ssh -L 11435:localhost:11435 username@134.155.86.170
```

### Step 3: Start LLM Instances
Start the primary instance with 32 GPU layers:


```sh
OLLAMA_NUM_GPU_LAYERS=32 ollama serve
```

Start the secondary instance (optimized for VRAM) with 16 GPU layers:

```sh
OLLAMA_HOST=0.0.0.0:11435 OLLAMA_NUM_GPU_LAYERS=16 ollama serve
```

(Optional) Start a CPU-only fallback instance (not implemented yet):

```sh
OLLAMA_HOST=0.0.0.0:11436 OLLAMA_NUM_GPU_LAYERS=0 ollama serve
```

### Testing the LLM Server
#### Check If the Model Is Running
Run the following command to check if the model is running on port 11435:

```sh
sudo lsof -i :11435
```

Verify SSH Tunnel
To ensure your SSH tunneling is set up correctly, test locally by running:

```sh
curl http://localhost:11434/api/tags
curl http://localhost:11435/api/tags
```

Generate Sample Outputs
Run a test query to verify model inference:

```sh
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "What is AI?",
  "stream": false
}'
```


Another test with custom parameters:


```sh
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Say hi",
  "stream": false,
  "options": {"max_tokens": 50}
}'
```