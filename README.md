# actransit-delays

| Title | actransit-delays |
|-|-|
| Developer    | [Seokhyeon Ryu](http://github.com/ryusock) |
| Link | [http://projects.dailycal.org/2017/bus-delays/](http://projects.dailycal.org/2017/bus-delays/) |

========================

* [What is this?](#what-is-this)
* [Assumptions](#assumptions)
* [Bootstrap the project](#bootstrap-the-project)
* [Save media assets](#save-media-assets)
* [Add a page to the site](#add-a-page-to-the-site)
* [Run the project](#run-the-project)
* [Run Python tests](#run-python-tests)
* [Run Javascript tests](#run-javascript-tests)
* [Compile static assets](#compile-static-assets)
* [Test the rendered app](#test-the-rendered-app)
* [Deploy to S3](#deploy-to-s3)

What is this?
-------------

This project measured the predictability of AC Transit buses at stops nearby the UC Berkeley campus, which was possible by utilizing data from NextBus, AC Transit's partner, on bus predictions.


Assumptions
-----------

The following things are assumed to be true in this documentation.

* You are running OSX.
* You have the [Gulp](https://gulpjs.com/) toolkit.
* You have the [Archie Markup Language](http://archieml.org/).

Bootstrap the project
---------------------

Node.js is required for the static asset pipeline. If you don't already have it, get it like this:

```
brew install node
curl https://npmjs.org/install.sh | sh
```

Then bootstrap the project:

```
cd public-trust
gulp
```

Run the project
---------------

A flask app is used to run the project locally. It will automatically recompile templates and assets on demand.

```
fab app
```

Visit [localhost:8000](http://localhost:8000) in your browser.

Compile static assets
---------------------

Compile LESS to CSS, compile javascript templates to Javascript and minify all assets:

```
fab render
```

(This is done automatically whenever you deploy to S3.)

Test the rendered app
---------------------

If you want to test the app once you've rendered it out, just use the Python webserver:

```
cd www
python -m SimpleHTTPServer
```

Deploy to S3
------------

```
fab staging master deploy
```

©2017 The Daily Californian
