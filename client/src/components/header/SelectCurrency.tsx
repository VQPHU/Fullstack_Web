import React from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select'

const SelectCurrency = () => {

    return (
        <Select>
            <SelectTrigger className="border-none bg-transparent focus:ring-0 focus:outline-none 
            shadow-none flex items-center justify-between px-2 py-1 data-[size=default]:h-6 
            dark:bg-transparent dark:hover:transparent ">
                <SelectValue placeholder="USD"></SelectValue>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Currencies</SelectLabel>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}

export default SelectCurrency
