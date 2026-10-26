export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export interface GameRecord {
  [key: string]: JsonValue | undefined;
  id?: number; dropid?: number; itemid?: number; name?: string; name_en?: string; title?: string;
  desc?: string; desc_en?: string; describe?: string; describe_en?: string;
  level?: number; quality?: number; items?: { [key: string]: JsonValue }[];
}
export interface Source { path: string; count: number; textEncoding: string; encryptedSha256: string; jsonSha256: string; replacementCharacters: number }
export interface WikiData { tables: Record<string, GameRecord[]>; metadata: { version: string; package: string; extracted: string; apkSha256: string; sources: Record<string, Source> } }
export interface Entry { cat: string; row: GameRecord; index: number; text: string }
export interface Relation { cat: string; index: number; name: string; why: string }
export interface IconMapping { url: string; source: string; kind: 'original' | 'related'; related?: string }
