declare function q(...args: any[]): HTMLElement;
declare function qn(...args: any[]): HTMLElement;

interface HTMLElement {
  q(...args: any[]): HTMLElement;
  qn(...args: any[]): HTMLElement;
  qget(qname: string): HTMLElement;
}
