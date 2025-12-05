const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ウィンドウ操作
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // LLM操作
  sendToLLM: (data) => ipcRenderer.invoke('send-to-llm', data),
  
  // プロンプト合成
  synthesizePrompt: (data) => ipcRenderer.invoke('synthesize-prompt', data)
});

console.log('✅ preload.js 読み込み完了');
