import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig
from app.core.config import settings

class LLMModel:
    def __init__(self):
        self.model_name = settings.LOCAL_LLM_MODEL_NAME
        print(f" CUDA available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f" Using GPU: {torch.cuda.get_device_name(0)}")
        else:
            print("  Using CPU - LLM will be VERY slow!")
        
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.llm = AutoModelForCausalLM.from_pretrained(
            self.model_name,
            torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None,
            trust_remote_code=True
        )
        self.gen_config = GenerationConfig.from_pretrained(self.model_name)
    
    def generate_response(self, messages, max_new_tokens=128, do_sample=True):
        input_ids = self.tokenizer.apply_chat_template(
            messages, tokenize=True, add_generation_prompt=True, return_tensors="pt"
        ).to(self.llm.device)
        output = self.llm.generate(
            input_ids, 
            generation_config=self.gen_config, 
            max_new_tokens=max_new_tokens, 
            do_sample=do_sample
        )
        response = self.tokenizer.decode(output[0][input_ids.shape[-1]:], skip_special_tokens=True)
        return response.strip()

llm_instance = LLMModel()
