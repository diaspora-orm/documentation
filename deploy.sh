cd dist/documentation
TEMP_DIR="$(mktemp -d)"
echo "Using temp dir $TEMP_DIR"
mv * $TEMP_DIR;
git init .

# Checkout old doc
git remote add origin https://github.com/diaspora-orm/diaspora.git
git fetch
git checkout gh-pages

# Save files
mv CNAME $TEMP_DIR

# Delete all files & replace them by new
rm -rf *
mv $TEMP_DIR/* .
rm -rf $TEMP_DIR

# copy the index file
cp index.html 404.html

# Commit and push
git add .
git commit -m $1
git push
