export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface RecognizedWord {
  text: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface PageOcrData {
  pageIndex: number;
  words: RecognizedWord[];
  imageWidth: number;
  imageHeight: number;
}

export interface UploadedPageItem {
  id: string;
  file: File;
  previewUrl: string;
  rotation: number;
}

export interface ProcessingProgress {
  currentPage: number;
  totalPages: number;
  percent: number;
  statusText: string;
}
