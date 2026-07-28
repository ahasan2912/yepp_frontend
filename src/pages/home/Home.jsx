import { useState } from "react";
import Banner from "../../components/home/Banner";
import Deals from "./deals/Deals";
import SearchDeals from "./deals/SearchDeals";

const Home = () => {
    const [searchText, setSearchText] = useState();

    const handleSearch = (value) => {
        setSearchText(value);
    }
    return (
        <div>
            <Banner handleSearch={handleSearch} />
            {
                searchText?.length > 0 ? <SearchDeals searchText={searchText} /> : <Deals />
            }
        </div>
    );
};

export default Home;