const resources = [
  "partner:ROGO:organization:org123",
  "organization:org123",
  "partner:ROGO:organization/org123",
  "organization/org123",
  "partner:ROGO:project/proj123"
];

for (const resource of resources) {
  const directMatch = resource.match(/^organization:(.+)$/);
  const nestedMatch = resource.match(/organization:([^:/]+)/);
  const nestedMatchOld = resource.match(/organization:([^:]+)/);
  const slashMatch = resource.match(/organization\/([^:/]+)/);
  console.log({ resource, directMatch: directMatch?.[1], nestedMatchOld: nestedMatchOld?.[1], nestedMatch: nestedMatch?.[1], slashMatch: slashMatch?.[1] });
}
