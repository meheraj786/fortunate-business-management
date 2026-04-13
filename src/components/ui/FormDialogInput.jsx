const FormDialogInput = ({
  label,
  id,
  name,
  type,
  placeholder,
  register,
  error,
  validation,
}) => {
  return (
    <div className="mt-4">
      <label
        htmlFor={id}
        className="text-start block text-sm/6 font-medium text-gray-900"
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          {...register(name, validation)}
          className="block w-full rounded-md bg-white px-3.5 py-2 text-sm/6 text-gray-900 
            border border-gray-300 placeholder:text-gray-400 
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
            transition-all duration-200"
        />
        {error && <span className="text-[var(--color-danger)] text-sm">{error.message}</span>}
      </div>
    </div>
  );
};

export default FormDialogInput;
