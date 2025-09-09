import 'stream-chat';


export type MessageInputFormattingType =  'bold' | 'italics' | 'code' | 'strikethrough';
export type MessageInputControlType = 'emoji' | 'attachment' | MessageInputFormattingType;

declare module 'stream-chat' {
  interface CustomChannelData {
    name?: string;
    demo?: string;
    private?: boolean;
    invite_only?: boolean;
    created_by_admin?: boolean;
    // Removed custom archive properties - using Stream native disabled/hidden instead
  }

  interface CustomMessageComposerData {
    command: 'giphy' | null;
    activeFormatting: MessageInputFormattingType | null;
  }
}