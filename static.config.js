import React from 'react'

const fs = require('fs')
const klaw = require('klaw')
const path = require('path')
const matter = require('gray-matter')

function getPosts () {
  const items = []
  // Walk ("klaw") through posts directory and push file paths into items array //
  const getFiles = () => new Promise(resolve => {
    // Check if posts directory exists //
    if (fs.existsSync('./src/posts')) {
      klaw('./src/posts')
        .on('data', item => {
          // Filter function to retrieve .md files //
          if (path.extname(item.path) === '.md') {
            // If markdown file, read contents //
            const data = fs.readFileSync(item.path, 'utf8')
            // Convert to frontmatter object and markdown content //
            const dataObj = matter(data)
            // Create slug for URL //
            dataObj.data.slug = dataObj.data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
            // Remove unused key //
            delete dataObj.orig
            // Push object into items array //
            items.push(dataObj)
          }
        })
        .on('error', e => {
          console.log(e)
        })
        .on('end', () => {
          // Resolve promise for async getRoutes request //
          // posts = items for below routes //
          resolve(items)
        })
    } else {
      // If src/posts directory doesn't exist, return items as empty array //
      resolve(items)
    }
  })
  return getFiles()
}

export class InitialHead extends React.Component {
  render() {
    return (
      <div>What</div>
    )
  }
}

export default {
  getSiteData: () => ({
    title: 'React Static with Netlify CMS',
  }),
  siteRoot: 'https://react-amp-netlify.netlify.com/',
  getRoutes: async () => {
    const posts = await getPosts()
    return [
      {
        path: '/',
        component: 'src/containers/Home',
      },
      {
        path: '/about',
        component: 'src/containers/About',
      },
      {
        path: '/blog',
        component: 'src/containers/Blog',
        getData: () => ({
          posts,
        }),
        children: posts.map(post => ({
          path: `/post/${post.data.slug}`,
          component: 'src/containers/Post',
          getData: () => ({
            post,
          }),
        })),
      },
      {
        is404: true,
        component: 'src/containers/404',
      },
    ]
  },
  Document: class CustomHTML extends React.Component {
    render() {
      const { Html, Head, Body, children, renderMeta } = this.props;
      const defaultStyle = `
        body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}
      `
      const noScriptStyle = `
        body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}
      `
      return (
        <Html lang="en-US" amp="true">
          <Head>
            <meta charSet="UTF-8" />
            <script async src="https://cdn.ampproject.org/v0.js"></script>
            <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />
            <meta name="fragment" content="!" />
            <link rel="canonical" href="https://react-amp-netlify.netlify.com/"></link>
            <style amp-boilerplate="true" dangerouslySetInnerHTML={{ __html: defaultStyle }}></style>
            <noscript>
              <style amp-boilerplate="true" dangerouslySetInnerHTML={{ __html: noScriptStyle }}></style>
            </noscript>
            <title>Hello AMP</title>
          </Head>
          <Body>
            {children}
          </Body>
        </Html>
      )
    }
  },
}
