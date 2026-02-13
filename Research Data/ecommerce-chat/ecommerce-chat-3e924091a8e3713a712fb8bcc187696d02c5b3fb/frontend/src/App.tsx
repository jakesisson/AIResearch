import { useState } from "react";
import { MessageCircle, ShoppingCart, User, Settings } from "lucide-react";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Motor de Vendas Conversacional
              </h1>
            </div>

            <nav className="hidden md:flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors">
                <ShoppingCart className="w-4 h-4" />
                <span>Carrinho</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors">
                <User className="w-4 h-4" />
                <span>Perfil</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </button>
            </nav>

            <button
              className="md:hidden p-2 rounded-md hover:bg-slate-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <div className="w-4 h-0.5 bg-current mb-1"></div>
                <div className="w-4 h-0.5 bg-current mb-1"></div>
                <div className="w-4 h-0.5 bg-current"></div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-col space-y-2">
              <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-left">
                <ShoppingCart className="w-4 h-4" />
                <span>Carrinho</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-left">
                <User className="w-4 h-4" />
                <span>Perfil</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-left">
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Bem-vindo ao seu Assistente de Vendas
            </h2>
            <p className="text-slate-600 text-lg">
              Encontre produtos, tire dúvidas e faça compras com a ajuda da
              nossa IA
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-slate-900 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Chat em Desenvolvimento
                </h3>
                <p className="text-slate-600">
                  A interface do chatbot será implementada na próxima fase
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-slate-600">
            <p>
              &copy; 2024 Motor de Vendas Conversacional. Desenvolvido com React
              + FastAPI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
