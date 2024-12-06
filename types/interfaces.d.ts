export interface Model {
  name: string;
}

export interface SettingsResponse {
  globalSettings: {
    defaultModel: string;
    visionEnabled: boolean;
    ipythonEnabled: boolean;
    toolsEnabled: boolean;
  };
  defaultTools: [object];
}

export interface ModelsResponse {
  models: Model[];
}

export interface Payload {
  model: string;
  messages: Message[];
  stream: boolean;
  tools?: Tool[];
}
