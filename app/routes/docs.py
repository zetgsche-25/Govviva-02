from flask import Blueprint, render_template_string
import os

docs_bp = Blueprint('docs', __name__)

@docs_bp.route('/render')
def render_docs():
    content_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'documentation_content.html')
    if not os.path.exists(content_path):
        return "Documentação não encontrada. Gere o conteúdo primeiro.", 404
    
    with open(content_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    template = """
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Documentação Técnica - GOVVIVA</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            @media print {
                .no-print { display: none; }
                body { background: white; }
                .container { max-width: 100%; padding: 0; }
                @page { margin: 2cm; }
            }
            body { background-color: #f8fafc; font-family: 'Inter', sans-serif; }
            h1 { font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1.5rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
            h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem; }
            h3 { font-size: 1.25rem; font-weight: 600; color: #334155; margin-top: 1.5rem; margin-bottom: 0.75rem; }
            p { margin-bottom: 1rem; line-height: 1.6; color: #475569; }
            ul, ol { margin-bottom: 1rem; padding-left: 1.5rem; list-style-type: disc; color: #475569; }
            ol { list-style-type: decimal; }
            li { margin-bottom: 0.5rem; }
            code { background-color: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875rem; color: #0f172a; }
            pre { background-color: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1.5rem; }
            pre code { background-color: transparent; color: inherit; padding: 0; }
            hr { border: 0; border-top: 1px solid #e2e8f0; margin: 2rem 0; }
            .badge { display: inline-block; padding: 0.25rem 0.75rem; background: #22c55e; color: white; border-radius: 9999px; font-weight: 600; font-size: 0.875rem; }
        </style>
    </head>
    <body>
        <div class="no-print bg-slate-900 text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-lg">
            <div class="flex items-center gap-2">
                <span class="font-bold text-xl tracking-tight">GOV<span class="text-blue-400">VIVA</span></span>
                <span class="text-slate-400 text-sm">| Documentação Técnica</span>
            </div>
            <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Salvar como PDF / Imprimir
            </button>
        </div>
        
        <div class="container mx-auto max-w-4xl bg-white shadow-xl my-8 p-12 rounded-xl border border-slate-200">
            <div class="documentation-content">
                {{ content | safe }}
            </div>
            
            <div class="mt-12 pt-8 border-top border-slate-100 text-center text-slate-400 text-sm">
                Documento gerado automaticamente pelo Sistema GOVVIVA - 2026
            </div>
        </div>
    </body>
    </html>
    """
    return render_template_string(template, content=content)
