all: Makefile.in

-include Makefile.in

RELEASE:=$(shell grep em:version install.rdf | head -n 1 | sed -e 's/ *<em:version>//' -e 's/<\/em:version>//')

zotero-wikidata.xpi: FORCE
	rm -rf $@
	npm run bundle
	zip -r $@ chrome chrome.manifest defaults install.rdf -x \*.DS_Store

zotero-wikidata-%.xpi: zotero-wikidata.xpi
	mv $< $@

Makefile.in: install.rdf
	echo "all: zotero-wikidata-${RELEASE}.xpi" > Makefile.in

FORCE:
