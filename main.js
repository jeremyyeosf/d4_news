const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000
const API_KEY = process.env.API_KEY || "1bd572f98198417e92b53bf53f861733"
const NEWS_URL = 'https://newsapi.org/v2/top-headlines'
// ?country=us&apiKey=1bd572f98198417e92b53bf53f861733
const app = express()

app.engine('hbs', 
    handlebars({defaultLayout: 'default.hbs'})
)

app.set('view engine', 'hbs')

app.get('/', (req, res) => {
    res.status(200)
    res.type('text/html')
    res.render('index')
})

app.get('/search', async (req, res) => {
    const search = req.query['inputSearch']
    const searchCountry = req.query['searchCountry']
    const searchCategory = req.query['searchCategory']
    console.log('Search query: ', search)
    console.log('Search country: ', searchCountry)
    console.log('Search category: ', searchCategory)
    const url = withQuery(NEWS_URL, {
        q: search,
        country: searchCountry,
        category: searchCategory,
        apiKey: API_KEY,
        pageSize: 5
    })
    const result = await fetch(url)
    console.log('First promise result:', result)
    const news = await result.json()
    console.log('Second promise result:', news)
    const news_articles = news.articles
        .map(d => {
            return {title: d.title, imageUrl: d.urlToImage, summary: d.description, publishedAt: d.publishedAt, articleUrl: d.url}
        })
    
    console.log('Total number of results: ', news.totalResults)
    res.status(200)
    res.type('text/html')
    res.render('news', {
        news_articles
        ,hasContent: news.totalResults > 0
    })
    
})

app.use(express.static(__dirname + '/static'))



if (API_KEY)
    app.listen(PORT, () => {
        console.log(`Application started on port: ${PORT} at ${new Date()}.`)
        console.log(`with API_KEY: ${API_KEY}`)
    }) 
else 
    console.error('API_KEY is not set.')

