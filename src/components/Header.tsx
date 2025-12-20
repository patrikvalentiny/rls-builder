import { Link, useLocation } from "wouter";

const Header = () => {
    const [location] = useLocation();

    const getLinkClass = (path: string) => {
        return `btn btn-sm ${location === path ? 'btn-primary' : 'btn-ghost'}`;
    };

    return (
        <div className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-4">PostgreSQL RLS Policy Builder</h1>
            <p className="text-lg mb-6">Create Row Level Security policies with ease</p>
            
            <div className="flex justify-center gap-4">
                <Link href="/overview">
                    <a className={getLinkClass('/overview')}>Overview</a>
                </Link>
                <Link href="/builder">
                    <a className={getLinkClass('/builder')}>Builder</a>
                </Link>
                <Link href="/parser">
                    <a className={getLinkClass('/parser')}>Parser</a>
                </Link> 
            </div>
        </div>
    );
};

export default Header;
