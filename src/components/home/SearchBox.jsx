import { useState } from 'react';
import { Search, SendHorizontal } from 'lucide-react';

const SearchBox = ({ handleSearch }) => {
    const [text, setText] = useState('');

    const handleSearchButton = (e) => {
        e.preventDefault();
        handleSearch(text);
    };
    return (
        <div className="mt-4 sm:mt-7.5">
            <form
                role="search"
                aria-label="Search local deals"
                onSubmit={handleSearchButton}
                autoComplete="off"
                className="flex max-w-70 sm:max-w-185 flex-nowrap items-center rounded-full bg-white px-2 py-2 sm:py-1.5 shadow-lg">
                <div className="flex min-w-0 flex-1 items-center gap-2 px-2 sm:gap-3 sm:px-4">
                    <Search className="h-4 w-4 shrink-0 text-gray-400 sm:h-5 sm:w-5" aria-hidden="true" />
                    <label htmlFor="deal-search" className="sr-only">Search ads</label>
                    <input
                        id="deal-search"
                        type="text"
                        autoComplete="off"
                        placeholder="Search by ads name, shop name or city"
                        className="min-w-0 w-full text-sm sm:text-base outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className="hidden cursor-pointer sm:block bg-primary hover:bg-secondary text-white text-sm sm:text-base px-4 sm:px-8 py-2 md:py-3 rounded-full font-medium transition-colors">
                    Search
                </button>
                <button
                    type="submit"
                    aria-label="Search deals"
                    className="sm:hidden shrink-0 text-white text-sm px-3 py-2 rounded-full font-medium transition-colors">
                    <SendHorizontal className="w-6 h-6 -rotate-45 text-primary" aria-hidden="true" />
                </button>
            </form>
        </div>
    );
};

export default SearchBox;
