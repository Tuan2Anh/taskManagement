import clsx from 'clsx';

const Input = ({ label, error, className, ...props }) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="block text-sm font-semibold text-slate-700 ml-1">
                    {label}
                </label>
            )}
            <input
                className={clsx(
                    'w-full px-4 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all font-medium text-slate-900 placeholder:text-slate-400',
                    error
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20',
                    className
                )}
                {...props}
            />
            {error && <p className="text-sm text-rose-500 ml-1">{error}</p>}
        </div>
    );
};

export default Input;
