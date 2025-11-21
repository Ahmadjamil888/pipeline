#!/usr/bin/env python3
"""
Pipeline AI - Model Upload Script
==================================

This script uploads your trained PyTorch model to HuggingFace Hub.
Use this after deploying your model through Pipeline AI.

Requirements:
    pip install huggingface_hub torch

Usage:
    python upload_model.py --token YOUR_HF_TOKEN --repo username/model-name --model path/to/model.pth
"""

import os
import argparse
import torch
from huggingface_hub import HfApi, upload_file, upload_folder

def upload_pytorch_model(
    model_path: str,
    repo_id: str,
    hf_token: str,
    model_name: str = "pytorch_model.bin"
):
    """
    Upload a PyTorch model to HuggingFace Hub
    
    Args:
        model_path: Path to your trained model (.pth or .bin file)
        repo_id: HuggingFace repository ID (username/model-name)
        hf_token: Your HuggingFace write token
        model_name: Name for the model file on HF (default: pytorch_model.bin)
    """
    
    print(f"🚀 Uploading model to HuggingFace Hub...")
    print(f"📦 Model: {model_path}")
    print(f"🔗 Repository: {repo_id}")
    
    # Initialize HF API
    api = HfApi()
    api.set_access_token(hf_token)
    
    # Verify the model file exists
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    
    # Check if it's a valid PyTorch model
    try:
        model_data = torch.load(model_path, map_location='cpu')
        print(f"✅ Valid PyTorch model detected")
        
        # Print model info
        if isinstance(model_data, dict):
            if 'model_state_dict' in model_data:
                print(f"📊 Model contains state dict with {len(model_data['model_state_dict'])} parameters")
            elif 'state_dict' in model_data:
                print(f"📊 Model contains state dict with {len(model_data['state_dict'])} parameters")
            else:
                print(f"📊 Model dict keys: {list(model_data.keys())}")
    except Exception as e:
        print(f"⚠️  Warning: Could not load model for verification: {e}")
        print(f"   Continuing with upload anyway...")
    
    # Upload the model file
    try:
        print(f"\n📤 Uploading model file...")
        upload_file(
            path_or_fileobj=model_path,
            path_in_repo=model_name,
            repo_id=repo_id,
            repo_type="model",
            token=hf_token
        )
        print(f"✅ Model uploaded successfully!")
        print(f"🔗 View your model at: https://huggingface.co/{repo_id}")
        
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        raise

def upload_model_folder(
    folder_path: str,
    repo_id: str,
    hf_token: str
):
    """
    Upload an entire folder containing model files to HuggingFace Hub
    
    Args:
        folder_path: Path to folder containing model files
        repo_id: HuggingFace repository ID (username/model-name)
        hf_token: Your HuggingFace write token
    """
    
    print(f"🚀 Uploading model folder to HuggingFace Hub...")
    print(f"📁 Folder: {folder_path}")
    print(f"🔗 Repository: {repo_id}")
    
    # Initialize HF API
    api = HfApi()
    api.set_access_token(hf_token)
    
    # Verify the folder exists
    if not os.path.exists(folder_path):
        raise FileNotFoundError(f"Folder not found: {folder_path}")
    
    # List files in folder
    files = os.listdir(folder_path)
    print(f"📦 Files to upload: {', '.join(files)}")
    
    # Upload the folder
    try:
        print(f"\n📤 Uploading folder...")
        upload_folder(
            folder_path=folder_path,
            repo_id=repo_id,
            repo_type="model",
            token=hf_token
        )
        print(f"✅ Folder uploaded successfully!")
        print(f"🔗 View your model at: https://huggingface.co/{repo_id}")
        
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        raise

def main():
    parser = argparse.ArgumentParser(
        description="Upload trained PyTorch model to HuggingFace Hub"
    )
    parser.add_argument(
        "--token",
        required=True,
        help="HuggingFace write token"
    )
    parser.add_argument(
        "--repo",
        required=True,
        help="Repository ID (username/model-name)"
    )
    parser.add_argument(
        "--model",
        help="Path to model file (.pth or .bin)"
    )
    parser.add_argument(
        "--folder",
        help="Path to folder containing model files"
    )
    parser.add_argument(
        "--name",
        default="pytorch_model.bin",
        help="Name for the model file on HF (default: pytorch_model.bin)"
    )
    
    args = parser.parse_args()
    
    # Validate arguments
    if not args.model and not args.folder:
        parser.error("Either --model or --folder must be specified")
    
    if args.model and args.folder:
        parser.error("Specify either --model or --folder, not both")
    
    try:
        if args.model:
            upload_pytorch_model(
                model_path=args.model,
                repo_id=args.repo,
                hf_token=args.token,
                model_name=args.name
            )
        else:
            upload_model_folder(
                folder_path=args.folder,
                repo_id=args.repo,
                hf_token=args.token
            )
            
        print("\n🎉 Upload complete!")
        print(f"🔗 Your model is now available at: https://huggingface.co/{args.repo}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
