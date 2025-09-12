'use client';

import { Button } from '@/components/ui/button';

interface TestButtonProps {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  body?: any;
}

export function TestButton({ name, url, method, body }: TestButtonProps) {
  return (
    <div className="border rounded p-3">
      <h3 className="font-medium mb-2">{name}</h3>
      <div className="flex gap-2 items-center mb-2">
        <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs font-mono">
          {method}
        </span>
        <span className="text-sm font-mono truncate">{url}</span>
      </div>
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Open a new window with the API response
            const win = window.open('', '_blank');
            if (!win) return;

            win.document.write('Loading...');

            // Make the API call
            fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json',
              },
              body: method === 'POST' ? JSON.stringify(body) : undefined,
            })
              .then((response) => {
                return response.json().then((data) => ({
                  status: response.status,
                  statusText: response.statusText,
                  headers: Object.fromEntries(response.headers.entries()),
                  data,
                }));
              })
              .then((result) => {
                // Format and display the response
                win.document.open();
                win.document.write(`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <title>API Response: ${url}</title>
                    <style>
                      body { font-family: system-ui, sans-serif; padding: 2rem; line-height: 1.5; }
                      pre { background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; overflow: auto; }
                      .status { font-weight: bold; margin-bottom: 1rem; }
                      .success { color: green; }
                      .error { color: red; }
                    </style>
                  </head>
                  <body>
                    <h1>API Response</h1>
                    <div>
                      <strong>URL:</strong> ${method} ${url}
                    </div>
                    <div>
                      <strong>Time:</strong> ${new Date().toLocaleString()}
                    </div>
                    <div class="status ${
                      result.status < 400 ? 'success' : 'error'
                    }">
                      Status: ${result.status} ${result.statusText}
                    </div>
                    
                    <h2>Headers</h2>
                    <pre>${JSON.stringify(result.headers, null, 2)}</pre>
                    
                    <h2>Response Body</h2>
                    <pre>${JSON.stringify(result.data, null, 2)}</pre>
                  </body>
                  </html>
                `);
                win.document.close();
              })
              .catch((err) => {
                win.document.open();
                win.document.write(`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <title>API Error: ${url}</title>
                    <style>
                      body { font-family: system-ui, sans-serif; padding: 2rem; line-height: 1.5; }
                      .error { color: red; font-weight: bold; }
                    </style>
                  </head>
                  <body>
                    <h1>API Request Failed</h1>
                    <div>
                      <strong>URL:</strong> ${method} ${url}
                    </div>
                    <div>
                      <strong>Time:</strong> ${new Date().toLocaleString()}
                    </div>
                    <div class="error">
                      Error: ${err.message}
                    </div>
                  </body>
                  </html>
                `);
                win.document.close();
              });
          }}
        >
          Test
        </Button>
      </div>
    </div>
  );
}
