// Dockerfile

function Image(project, name, pathname) {
    this.pathname = pathname;
    this.name = name;
}
// util.inherits(Image, Resource); // only once Kube resource concerns
// are factored out of Resource

module.exports = Image;
