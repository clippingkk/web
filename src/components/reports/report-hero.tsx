import React from 'react'
import { fetchYearlyReport_reportYearly_books } from '../../schema/__generated__/fetchYearlyReport'
import { WenquBook } from '../../services/wenqu'
import PublicBookItem from '../public-book-item/public-book-item'

type ReportHeroProps = {
    books: WenquBook[]
    clippings: readonly fetchYearlyReport_reportYearly_books[]
}

function ReportHero(props: ReportHeroProps) {
    return (
        <div
            className={`flex flex-wrap justify-center items-center ${props.books.length > 8 ? 'py-10 lg:py-20 ' : ''}`}
        >
            {props.books.map(b => (
                <PublicBookItem key={b.id} book={b} />
            ))}
        </div>
    )
}

export default ReportHero
