
import Head from 'next/head'

export default ({ children, title = 'This is the default title' }) => (
    <div>
        <Head>
            <title>{ title }</title>
            <meta charSet='utf-8' />
            <meta name='viewport' content='initial-scale=1.0, width=device-width' />
            <meta httpEquiv="x-ua-compatible" content="ie=edge" />
            <meta name="format-detection" content="telephone=no" />
            <meta httpEquiv="x-dns-prefetch-control" content="on" />
            <meta name="description" content="" />
            <meta name="keyword" content="" />
        </Head>
        { children }
        <footer>
            {'I`m here to stay footer'}
        </footer>
    </div>
)