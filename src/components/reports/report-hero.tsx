import React from 'react'
import { fetchYearlyReport_reportYearly_books } from '../../schema/__generated__/fetchYearlyReport'
import { WenquBook } from '../../services/wenqu'
import PublicBookItem from '../public-book-item/public-book-item'
import styles from './report-hero.module.css'

type ReportHeroProps = {
    books: WenquBook[]
    clippings: readonly fetchYearlyReport_reportYearly_books[]
}

function ReportHero(props: ReportHeroProps) {
    return (
        <div
            className={`flex flex-wrap justify-center items-center ${props.books.length > 8 ? 'py-10 lg:py-20 ' : ''}`}
        >
            {props.books.map((b, i) => (
                <div
                    key={b.id}
                    className={styles.cell}
                    style={{
                        animationDelay: `${100 * (i + 1)}ms`
                    }}
                >
                    <PublicBookItem book={b} />
                </div>
            ))}
        </div>
    )
}

export default ReportHero
