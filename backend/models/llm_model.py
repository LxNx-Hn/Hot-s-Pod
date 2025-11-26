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
        
        # pad_token 설정 (없으면 eos_token 사용)
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
            self.tokenizer.pad_token_id = self.tokenizer.eos_token_id
        
        self.llm = AutoModelForCausalLM.from_pretrained(
            self.model_name,
            torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None,
            trust_remote_code=True
        )
        self.gen_config = GenerationConfig.from_pretrained(self.model_name)
        
        # pad_token_id 설정
        if self.gen_config.pad_token_id is None:
            self.gen_config.pad_token_id = self.tokenizer.pad_token_id
    
    def generate_response(self, messages, max_new_tokens=128, do_sample=True):
        input_ids = self.tokenizer.apply_chat_template(
            messages, tokenize=True, add_generation_prompt=True, return_tensors="pt"
        ).to(self.llm.device)
        
        # attention_mask 생성 (pad_token이 아닌 모든 토큰은 1)
        attention_mask = (input_ids != self.tokenizer.pad_token_id).long().to(self.llm.device)
        
        output = self.llm.generate(
            input_ids,
            attention_mask=attention_mask,
            generation_config=self.gen_config, 
            max_new_tokens=max_new_tokens, 
            do_sample=do_sample,
            pad_token_id=self.tokenizer.pad_token_id
        )
        response = self.tokenizer.decode(output[0][input_ids.shape[-1]:], skip_special_tokens=True)
        return response.strip()

llm_instance = LLMModel()
