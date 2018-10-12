ROOT_DIR := $(shell pwd)
BUILD_DIR := $(ROOT_DIR)/build
VERSION := $(shell grep '"version":' $(ROOT_DIR)/manifest.json | sed -E 's/.*"version": "([^"]+)".*/\1/')
DATE := $(shell date '+%Y%m%d-%H%M%S')
BUNDLE_FILE_NAME := bitbucket-pr-$(VERSION).zip
BUNDLE_FILE_PATH := $(BUILD_DIR)/$(BUNDLE_FILE_NAME)
BIN_DIR := node_modules/.bin
ESLINT := $(BIN_DIR)/eslint
NODE_SASS := $(BIN_DIR)/node-sass
SASS_LINT := $(BIN_DIR)/sass-lint

.PHONY: bundle clean compile-scss lint test

bundle: lint $(BUNDLE_FILE_PATH)

clean:
	rm -rf $(BUILD_DIR)

compile-scss: $(NODE_SASS)
	$(NODE_SASS) --output src src/style.scss
	$(NODE_SASS) --watch --output src src/style.scss

lint: $(ESLINT) $(SASS_LINT)
	$(ESLINT) src/
	$(SASS_LINT) -v -q src/*.scss

test: lint
	open $(ROOT_DIR)/tests/index.html

$(BUNDLE_FILE_PATH):
	mkdir -p $(BUILD_DIR)
	zip -r $(BUNDLE_FILE_PATH) manifest.json src/*.js src/*.css images/*.png

$(ESLINT):
	npm install

$(NODE_SASS):
	npm install

$(SASS_LINT):
	npm install
