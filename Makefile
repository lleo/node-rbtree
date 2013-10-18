MK_DATA=./bin/make_test_data.js
LIB=./lib
LIBS=$(./lib/*.js)
LIBCOV=./lib-cov
JSCOVERAGE=jscoverage
HTML=jscov.html
NUM=1024
INORDER_DATA_FN=./test/inorder-$(NUM).dat.json
RAND_DATA_FN=./test/rand-$(NUM).dat.json
RAND2_DATA_FN=./test/rand2-$(NUM).dat.json

$(INORDER_DATA_FN):
	$(MK_DATA) -o inorder -n $(NUM) > $(INORDER_DATA_FN)

$(RAND_DATA_FN):
	$(MK_DATA) -o rand -n $(NUM) > $(RAND_DATA_FN)

$(RAND2_DATA_FN):
	$(MK_DATA) -o rand -n $(NUM) > $(RAND2_DATA_FN)

inorder-data: $(INORDER_DATA_FN)

rand-data: $(RAND_DATA_FN)

rand2-data: $(RAND2_DATA_FN)

test-data: inorder-data rand-data rand2-data

lib-cov: $(LIBS)
	rm -rf $(LIBCOV)
	$(JSCOVERAGE) $(LIB) $(LIBCOV)

test-cov: test-data lib-cov
	JSCOV=1 mocha -R html-cov test/??-*.js > $(HTML)

test: test-data
	mocha -R spec test/??-*.js

clean:
	rm -rf $(LIBCOV) $(INORDER_DATA_FN) $(RAND_DATA_FN) $(RAND2_DATA_FN) $(HTML)
