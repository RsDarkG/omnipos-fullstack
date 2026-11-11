import React, { useState, useRef, useEffect } from 'react';

interface Product {
  id: number;
  barcode: string;
  name: string;
  salePrice: number;
  taxRate: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

const MOCK_CATALOG: Product[] = [
  { id: 1, barcode: '7701001', name: 'Café Molido Gourmet 500g', salePrice: 28500, taxRate: 0.05, stock: 15 },
  { id: 2, barcode: '7701002', name: 'Audífonos Inalámbricos Pro', salePrice: 145000, taxRate: 0.19, stock: 4 },
  { id: 3, barcode: '7701003', name: 'Teclado Mecánico RGB', salePrice: 210000, taxRate: 0.19, stock: 2 },
];

export default function PosTerminal() {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState<'NONE' | 'VIP10'>('NONE');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const scannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scannerInputRef.current?.focus();
  }, [cart]);

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const product = MOCK_CATALOG.find(
      (p) => p.barcode === barcodeInput.trim() || p.name.toLowerCase().includes(barcodeInput.toLowerCase())
    );

    if (!product) {
      setStatusMsg({ type: 'err', text: `Producto no encontrado: ${barcodeInput}` });
      setBarcodeInput('');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          setStatusMsg({ type: 'err', text: `Stock máximo alcanzado para ${product.name}` });
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    setBarcodeInput('');
    setStatusMsg(null);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
  const taxTotal = cart.reduce((acc, item) => acc + item.salePrice * item.quantity * item.taxRate, 0);
  const discountTotal = discountCode === 'VIP10' ? subtotal * 0.1 : 0;
  const finalTotal = Math.round(subtotal + taxTotal - discountTotal);

  const handleCheckout = async () => {
    const payments = [];
    if (Number(cashAmount) > 0) payments.push({ method: 'CASH', amount: Number(cashAmount) });
    if (Number(transferAmount) > 0) payments.push({ method: 'TRANSFER', amount: Number(transferAmount), reference: 'NEQUI-POS' });

    const payload = {
      channel: 'POS',
      discountCode,
      items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
      payments,
    };

    try {
      const res = await fetch('http://localhost:8080/api/v1/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatusMsg({ type: 'err', text: data.message || 'Error al procesar la venta' });
        return;
      }

      setStatusMsg({ type: 'ok', text: `Venta exitosa: ${data.orderNumber} por $${data.total.toLocaleString()}` });
      setCart([]);
      setCashAmount('');
      setTransferAmount('');
    } catch {
      setStatusMsg({ type: 'err', text: 'Servidor Backend fuera de línea. Verifica que Spring Boot esté corriendo.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      <div className="lg:col-span-2 bg-slate-900 rounded-xl p-6 border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-emerald-400">OmniPOS Terminal v1.0</h1>
            <span className="text-xs bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-700">
              Caja #01 • Turno Abierto
            </span>
          </div>

          <form onSubmit={handleBarcodeScan} className="mb-6 flex gap-3">
            <input
              ref={scannerInputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Escanea código de barras (ej: 7701001) o escribe el nombre y presiona Enter..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-semibold transition"
            >
              Agregar
            </button>
          </form>

          {statusMsg && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
              statusMsg.type === 'ok' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' : 'bg-red-900/50 text-red-300 border border-red-700'
            }`}>
              {statusMsg.text}
            </div>
          )}

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-sm">
                <th className="py-3">Código</th>
                <th>Producto</th>
                <th className="text-center">Cant.</th>
                <th className="text-right">Precio Unit.</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                  <td className="py-3 font-mono text-xs text-slate-400">{item.barcode}</td>
                  <td className="font-medium">{item.name}</td>
                  <td className="text-center font-bold text-emerald-400">{item.quantity}</td>
                  <td className="text-right">${item.salePrice.toLocaleString()}</td>
                  <td className="text-right font-semibold">${(item.salePrice * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    La factura está vacía. Escanea un código (7701001, 7701002 o 7701003) para comenzar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold mb-4 border-b border-slate-800 pb-2">Resumen de Factura</h2>

          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal Base:</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Impuestos (IVA):</span>
              <span>${Math.round(taxTotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Convenio / Descuento:</span>
              <select
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value as 'NONE' | 'VIP10')}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
              >
                <option value="NONE">Sin Descuento</option>
                <option value="VIP10">Cliente VIP (-10%)</option>
              </select>
            </div>
            <div className="flex justify-between text-2xl font-extrabold text-white pt-4 border-t border-slate-800">
              <span>TOTAL A COBRAR:</span>
              <span className="text-emerald-400">${finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-slate-300 mb-3">Métodos de Pago (Split Payment)</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Efectivo Recibido ($)</label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-right font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Transferencia / QR / Datáfono ($)</label>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-right font-mono"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={cart.length === 0}
          className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black py-4 rounded-xl text-lg transition"
        >
          FACTURAR E IMPRIMIR (F4)
        </button>
      </div>
    </div>
  );
}
