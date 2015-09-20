import util = require("util");

export abstract class Command implements Operation {
  summary: string = "UNSET!"
	
  abstract execute(project, kube)
}
