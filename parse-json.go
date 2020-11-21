package main

import (
  "os"
  "fmt"
  "io/ioutil"
  "encoding/json"
)

func main(){

  file, err := os.Open("formatted-website.json")

  if err != nil {
    fmt.Println("Error: failed to load/open file.")
    return
  }

  defer file.Close()

  fmt.Println("Reading file ...")
  bytes, err := ioutil.ReadAll(file)

  if err != nil {
    fmt.Println("Error: failed to fetch file bytes.")
    return
  }

  var data interface{}
  fmt.Println("Parsing json ...")
  json.Unmarshal([]byte(bytes), &data)

  fmt.Println(data)
}
