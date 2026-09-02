import { useState } from "react";
import { Plus, Pencil, X, Landmark, CreditCard, Wallet, Banknote, CircleDollarSign } from "lucide-react";
import { usePaymentMethods } from "@/hooks/usePayments";
import { useCreatePaymentMethod, useUpdatePaymentMethod, type PaymentMethodPayload } from "@/queries/usePaymentMutations";
import type { PaymentMethod } from "@/services/administration/payments.types";

interface PaymentTypeOption {
  id: number;
  type: string;
  currency: "USD" | "VES";
}

const typeIcons: Record<string, typeof Landmark> = {
  "pago móvil": CreditCard,
  "zelle": CircleDollarSign,
  "transferencia": Landmark,
  "efectivo": Banknote,
};

const emptyForm: PaymentMethodPayload = {
  paymentTypeId: 0,
  bank: "",
  accountNumber: "",
  identification: "",
  email: "",
  phone: "",
  owner: "",
  active: true,
};

export default function AccountsView() {
  const { data: rawMethods = [] } = usePaymentMethods();
  const { mutateAsync: createMethod, isPending: isCreating } = useCreatePaymentMethod();
  const { mutateAsync: updateMethod, isPending: isUpdating } = useUpdatePaymentMethod();

  const methods = (rawMethods as PaymentMethod[]) ?? [];
  const paymentTypes = methods.reduce<PaymentTypeOption[]>((acc, m) => {
    if (!acc.some((t) => t.id === m.paymentType.id)) {
      acc.push({ id: m.paymentType.id, type: m.paymentType.type, currency: m.paymentType.currency });
    }
    return acc;
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PaymentMethodPayload>({ ...emptyForm });
  const [error, setError] = useState("");

  const isEfectivo = (typeName: string) => typeName.toLowerCase() === "efectivo";

  const handleNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setShowForm(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingId(method.id);
    setForm({
      paymentTypeId: method.paymentType.id,
      bank: method.bank ?? "",
      accountNumber: method.accountNumber ?? "",
      identification: method.identification ?? "",
      email: method.email ?? "",
      phone: method.phone ?? "",
      owner: method.owner ?? "",
      active: method.active,
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.paymentTypeId) {
      setError("Selecciona un tipo de pago");
      return;
    }
    const typeName = paymentTypes.find((t) => t.id === form.paymentTypeId)?.type ?? "";
    if (isEfectivo(typeName)) {
      setError("No se pueden crear cuentas de efectivo");
      return;
    }

    if (typeName.toLowerCase() === "pago móvil") {
      if (!form.bank?.trim() || !form.identification?.trim() || !form.phone?.trim() || !form.owner?.trim()) {
        setError("Completa banco, cédula, teléfono y dueño");
        return;
      }
    } else if (typeName.toLowerCase() === "zelle") {
      if (!form.email?.trim()) {
        setError("Completa el correo electrónico");
        return;
      }
    } else if (typeName.toLowerCase() === "transferencia") {
      if (!form.bank?.trim() || !form.accountNumber?.trim() || !form.owner?.trim()) {
        setError("Completa banco, número de cuenta y dueño");
        return;
      }
    }

    try {
      if (editingId) {
        await updateMethod({ id: editingId, data: form });
      } else {
        await createMethod(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
    } catch {
      setError("Error al guardar");
    }
  };

  const selectedType = paymentTypes.find((t) => t.id === form.paymentTypeId);
  const selectedTypeName = selectedType?.type?.toLowerCase() ?? "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Gestiona las cuentas de pago del colegio</p>
        <button
          type="button"
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) text-white rounded-lg text-sm font-medium hover:brightness-110 transition cursor-pointer"
        >
          <Plus size={16} />
          Agregar Cuenta
        </button>
      </div>

      {methods.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Landmark size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">No hay cuentas registradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {methods.map((method) => {
            const Icon = typeIcons[method.paymentType.type] ?? Landmark;
            const editable = !isEfectivo(method.paymentType.type);
            return (
              <div
                key={method.id}
                className={`border rounded-lg p-4 bg-white relative ${method.active ? "border-(--lightBlueColor)/20" : "border-gray-200 opacity-60"}`}
              >
                {editable && (
                  <button
                    type="button"
                    onClick={() => handleEdit(method)}
                    className="absolute top-3 right-3 p-1.5 hover:bg-(--lightBlueColor)/10 rounded-lg transition cursor-pointer text-gray-400 hover:text-(--blueColor)"
                  >
                    <Pencil size={14} />
                  </button>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-(--lightBlueColor)/10 rounded-lg flex items-center justify-center">
                    <Icon size={20} className="text-(--darkBlueColor)" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{method.paymentType.type}</p>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${method.paymentType.currency === "USD" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {method.paymentType.currency}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {method.bank && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Banco:</span>
                      <span className="text-gray-700 font-medium">{method.bank}</span>
                    </div>
                  )}
                  {method.accountNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cuenta:</span>
                      <span className="text-gray-700 font-mono font-medium">{method.accountNumber}</span>
                    </div>
                  )}
                  {method.identification && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cédula:</span>
                      <span className="text-gray-700 font-medium">{method.identification}</span>
                    </div>
                  )}
                  {method.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Correo:</span>
                      <span className="text-gray-700 font-medium">{method.email}</span>
                    </div>
                  )}
                  {method.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Teléfono:</span>
                      <span className="text-gray-700 font-medium">{method.phone}</span>
                    </div>
                  )}
                  {method.owner && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dueño:</span>
                      <span className="text-gray-700 font-medium">{method.owner}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${method.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {method.active ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-(--darkBlueColor)">
                {editingId ? "Editar Cuenta" : "Agregar Cuenta"}
              </h2>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                  Tipo de Pago <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.paymentTypeId || ""}
                  onChange={(e) => setForm({ ...emptyForm, paymentTypeId: Number(e.target.value) })}
                  disabled={!!editingId}
                  className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm bg-white disabled:opacity-50"
                >
                  <option value="">Seleccione tipo...</option>
                  {paymentTypes.filter((t) => !isEfectivo(t.type)).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.type} ({t.currency})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTypeName === "pago móvil" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                      Banco <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.bank ?? ""}
                      onChange={(e) => setForm({ ...form, bank: e.target.value })}
                      placeholder="Banco de Venezuela"
                      className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                      Cédula <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.identification ?? ""}
                      onChange={(e) => setForm({ ...form, identification: e.target.value })}
                      placeholder="V-12345678"
                      className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.phone ?? ""}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0412-1234567"
                      className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                      Dueño <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.owner ?? ""}
                      onChange={(e) => setForm({ ...form, owner: e.target.value })}
                      placeholder="Nombre y apellido"
                      className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                    />
                  </div>
                </>
              )}

              {selectedTypeName === "zelle" && (
                <div>
                  <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email ?? ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                  />
                </div>
              )}

              {selectedTypeName === "transferencia" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                      Banco <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.bank ?? ""}
                      onChange={(e) => setForm({ ...form, bank: e.target.value })}
                      placeholder="Banco Mercantil"
                      className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                      Número de Cuenta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.accountNumber ?? ""}
                      onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                      placeholder="0134-0000-00-0000000000"
                      className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                      Dueño <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.owner ?? ""}
                      onChange={(e) => setForm({ ...form, owner: e.target.value })}
                      placeholder="Nombre y apellido"
                      className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                    />
                  </div>
                </>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
                className="px-6 py-2 bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) text-white rounded-lg text-sm font-medium hover:brightness-110 transition cursor-pointer disabled:opacity-60"
              >
                {isCreating || isUpdating ? "Guardando..." : editingId ? "Guardar Cambios" : "Crear Cuenta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
