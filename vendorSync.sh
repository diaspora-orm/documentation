VENDOR_DIR="vendor/typedoc-default-themes/src/default/assets"
COMPONENT_VENDOR_DIR="src/scss/vendor/"

rm -r $COMPONENT_VENDOR_DIR
mkdir -p $COMPONENT_VENDOR_DIR
cp -R $VENDOR_DIR/css/setup/ $COMPONENT_VENDOR_DIR/scss
find $COMPONENT_VENDOR_DIR/scss -type f -name '*.s?ss' -print0 | xargs -0 sed -e 's:../images:/assets/images/typedoc:g' -i'.bak'
cp -R $VENDOR_DIR/images/ src/assets/images/typedoc;
