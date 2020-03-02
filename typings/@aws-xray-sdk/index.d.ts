 declare module 'aws-xray-sdk' {
  export function captureAWSClient<T>(client: T): T;
  export function captureFunc<T>(name: string, fcn: any): T;
}