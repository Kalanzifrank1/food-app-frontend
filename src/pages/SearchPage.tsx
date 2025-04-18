import { useSearchRestaurants } from "@/api/RestaurantApi"
import CuisinesFilter from "@/components/CuisinesFilter"
import PaginationSelector from "@/components/PaginationSelector"
import SearchBar, { SearchForm } from "@/components/SearchBar"
import SearchResultsCard from "@/components/SearchResultsCard"
import SearchResultInfo from "@/components/SearchResultsInfo"
import SortOptionDropDown from "@/components/SortOptionDropDown"
import { useState } from "react"
import { useParams } from "react-router-dom"


export type SearchState = {
    searchQuery: string;
    page: number;
    selectedCuisines: string[];
    sortOption: string
}
const SearchPage = () => {

    const { city } = useParams()

    const setPage = (page: number) => {
        setSearchState((prevState) => ({
            ...prevState,
            page,
        }))
    }

    const [searchState, setSearchState] = useState<SearchState>({
        searchQuery: "",
        page: 1,
        selectedCuisines: [],
        sortOption: "bestMatch"
    })

    const [isExpanded, setIsExpanded] = useState<boolean>(false )

    const { results, isPending } = useSearchRestaurants(searchState, city)

    const setSortOption = (sortOption: string) => {
        setSearchState((prevState) => ({
            ...prevState,
            sortOption,
            page: 1
        }))
    }

    const setSelectedCuisines = (selectedCuisines: string[]) => {
        setSearchState((prevState) => ({
            ...prevState,
            selectedCuisines,
            page: 1
        }))
    }

    const setSearchQuery = (searchFormData: SearchForm) => {
        setSearchState((prevState) => ({
            ...prevState,
            searchQuery: searchFormData.searchQuery,
            page: 1
        }))
    }

    const resetSearch = () => {
        setSearchState((prevState) => ({
            ...prevState,
            searchQuery: ""
        }))
    }

    if(isPending){
        <span>Loading.....</span>
    }

    if(!results?.data || !city){
        return <span>No results found</span>
    }


  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
        <div id="cuisines-list">
            <CuisinesFilter 
                selectedCuisines={searchState.selectedCuisines}
                onChange={setSelectedCuisines}
                isExpanded = {isExpanded}
                onExpandedClick={() => setIsExpanded((prevIsExpanded) => !prevIsExpanded)}
            />
        </div>
        <div id="main-content" className="flex flex-col gap-5">
            <SearchBar 
                searchQuery={searchState.searchQuery}
                onSubmit={setSearchQuery} 
                placeHolder="Search by cuisine or Restaurant Name"
                onReset={resetSearch}
            />
            <div className="flex justify-between flex-col gap-3 lg:flex-row">
                <SearchResultInfo total={results.pagination.total} city={city}/>
                <SortOptionDropDown sortOption={searchState.sortOption} onChange={(value) => setSortOption(value)}/>
            </div>
            {
                results.data.map((restaurant) => (
                    <SearchResultsCard restaurant={restaurant}/>
                ))
            }
            <PaginationSelector
                 page={results.pagination.page}
                 pages={results.pagination.pages}
                 onPageChange={setPage }
             />
        </div>
    </div>
  )
}

export default SearchPage
