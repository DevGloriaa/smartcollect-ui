export default function DashboardFooter() {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-700 py-4 text-center text-gray-600 dark:text-gray-400 text-sm mt-10">
            © {new Date().getFullYear()} SmartCollect — Secure. Smart. Simple.
        </footer>
    );
}
