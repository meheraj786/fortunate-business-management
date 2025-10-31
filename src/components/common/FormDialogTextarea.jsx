const FormDialogTextarea = ({ label, id, name, rows, placeholder }) => {
  return (
    <div className="mt-4">
      <label
        htmlFor={id}
        className="text-start block text-sm/6 font-medium text-gray-900 dark:text-black"
      >
        {label}
      </label>
      <div className="mt-2">
        <textarea
          id={id}
          name={name}
          rows={rows}
          placeholder={placeholder}
          className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-black/5 dark:text-black dark:outline-black/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
        />
      </div>
    </div>
  );
};

export default FormDialogTextarea;
