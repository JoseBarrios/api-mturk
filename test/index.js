import test from "tape"
import mturkApi from "../"

test("mturkApi", (t) => {
  t.plan(1)
  t.equal(true, mturkApi(), "return true")
})
