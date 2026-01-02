import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const Button = ({ children, loading, disabled, variant = 'primary', className, ...props }) => {
    const variants = {
        primary: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900/20',
        secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500/20',
        danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500/20',
        outline: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-slate-500/10'
    };

    return (
        <button
            disabled={disabled || loading}
            className={clsx(
                'inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 transform active:scale-[0.98] focus:outline-none focus:ring-4 disabled:opacity-70 disabled:cursor-not-allowed',
                variants[variant],
                className
            )}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
};

export default Button;
