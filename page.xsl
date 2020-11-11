<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/">
<html xmlns:xi="http://www.w3.org/2001/XInclude" lang="en">
  <xi:include href="header.xml"/>
  <body><xsl:value-of select="body"/></body>
  <xi:include href="footer.xml"/>
</html>
</xsl:template>
</xsl:stylesheet>