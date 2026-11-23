.PHONY: build run clean

APP_NAME := http

all: clean build

build:
	mkdir -p out
	gcc -std=c23 -O2 -Wall -Wextra -o out/$(APP_NAME) src/main.c

clean:
	rm -fr out

#
# test
#

_version:
	./out/$(APP_NAME) --version

_download:
	./out/$(APP_NAME) ~/Downloads