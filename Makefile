ROOT_DIR := $(shell pwd)
BUILD_DIR := $(ROOT_DIR)/build
VERSION := $(shell grep '"version":' $(ROOT_DIR)/manifest.json | sed -E 's/.*"version": "([^"]+)".*/\1/')
DATE := $(shell date '+%Y%m%d-%H%M%S')
BUNDLE_FILE_NAME := bitbucket-pr-$(VERSION).zip
BUNDLE_FILE_PATH := $(BUILD_DIR)/$(BUNDLE_FILE_NAME)

.PHONY: bundle clean test

bundle: $(BUNDLE_FILE_PATH)

clean:
	rm -rf $(BUILD_DIR)

test:
	open $(ROOT_DIR)/tests/index.html

$(BUNDLE_FILE_PATH):
	mkdir -p $(BUILD_DIR)
	cd src
	zip -r $(BUNDLE_FILE_PATH) manifest.json src
