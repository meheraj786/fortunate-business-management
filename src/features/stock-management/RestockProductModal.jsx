import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Calendar, PackagePlus, X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useRestockProduct } from "@/api/hooks/products";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import TextAreaField from "@/components/ui/TextAreaField";

const localDateTime = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const RestockProductModal = ({ isOpen, onClose, onSuccess, product, warehouseId }) => {
  const [requestKey] = useState(() =>
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
  );
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { quantityAdded: "", receivedAt: localDateTime(), notes: "" },
  });
  const restockMutation = useRestockProduct(warehouseId, product?._id);
  const [preview, setPreview] = useState(null);
  const isSubmitting = restockMutation.isPending;

  const onSubmit = (values) => {
    const quantityAdded = Number(values.quantityAdded);
    restockMutation.mutate({
      quantityAdded,
      receivedAt: new Date(values.receivedAt).toISOString(),
      notes: values.notes,
      idempotencyKey: requestKey,
    }, {
      onSuccess: (response) => {
        onSuccess?.(response);
        onClose();
      },
    });
  };

  const unit = product?.unit?.name || "units";
  const projectedQuantity = preview && Number.isFinite(Number(preview))
    ? Number(product?.quantity || 0) + Number(preview)
    : null;

  return (
    <Dialog open={isOpen} onClose={isSubmitting ? () => {} : onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 w-screen overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-start justify-between bg-[var(--color-primary)] p-5 text-white">
              <div className="flex gap-3"><PackagePlus className="mt-0.5" /><div><h2 className="text-xl font-bold">Add Stock</h2><p className="mt-1 text-sm text-white/80">Receive more of {product?.name}. Product details will not change.</p></div></div>
              <Button onClick={onClose} disabled={isSubmitting} variant="subtle" className="!p-1 text-white" aria-label="Close"><X /></Button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5">
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                Current stock: <strong>{product?.quantity} {unit}</strong>
                {projectedQuantity !== null && <span className="block mt-1">New stock after receiving: <strong>{projectedQuantity} {unit}</strong></span>}
              </div>
              <Controller name="quantityAdded" control={control} rules={{ required: "Quantity is required", min: { value: 0.000001, message: "Enter an amount greater than zero" } }} render={({ field }) => (
                <InputField {...field} label={`Quantity to add (${unit})`} required type="number" min="0.000001" step="any" error={errors.quantityAdded?.message} placeholder="233" icon={PackagePlus} disabled={isSubmitting} onChange={(event) => { field.onChange(event.target.value); setPreview(event.target.value); }} />
              )} />
              <Controller name="receivedAt" control={control} rules={{ required: "Received date is required" }} render={({ field }) => (
                <InputField {...field} label="Received date and time" required type="datetime-local" error={errors.receivedAt?.message} icon={Calendar} disabled={isSubmitting} />
              )} />
              <TextAreaField label="Receiving note (optional)" name="notes" register={register} placeholder="Supplier invoice, delivery reference, or reason for restock" rows={3} />
              <p className="text-xs text-gray-500">This creates a permanent receiving record with the previous and new balance.</p>
              <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button><Button type="submit" variant="primary" isLoading={isSubmitting}><PackagePlus size={16} className="mr-2" />Add Stock</Button></div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default RestockProductModal;
