<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="utf-8" indent="yes" doctype-system="about:legacy-compat"/>
  <xsl:template match="/page">
    <html lang="en-US">
      <head>
        <title><xsl:value-of select="@title"/></title>
      </head>
    </html>
    <body>
      <xsl:copy-of select="./*"/>
    </body>
  </xsl:template>
</xsl:stylesheet>