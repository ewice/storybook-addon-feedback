import{j as l}from"./jsx-runtime-DQZO7EKT.js";import"./iframe-B5azqinh.js";import"./preload-helper-C1FmrZbK.js";const c=({label:d,primary:a=!1,onClick:u})=>{const m={padding:"8px 16px",borderRadius:"4px",border:"none",backgroundColor:a?"#1ea7fd":"#e2e8f0",color:a?"#ffffff":"#1e293b",fontWeight:"600",cursor:"pointer",fontFamily:"sans-serif"};return l.jsx("button",{style:m,onClick:u,children:d})};c.__docgenInfo={description:"",methods:[],displayName:"Button",props:{label:{required:!0,tsType:{name:"string"},description:""},primary:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};const b={title:"Components/Button",component:c},e={args:{primary:!0,label:"Primary Button"}},r={args:{primary:!1,label:"Secondary Button"}};var o,t,n;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    primary: true,
    label: 'Primary Button'
  }
}`,...(n=(t=e.parameters)==null?void 0:t.docs)==null?void 0:n.source}}};var s,i,p;r.parameters={...r.parameters,docs:{...(s=r.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    primary: false,
    label: 'Secondary Button'
  }
}`,...(p=(i=r.parameters)==null?void 0:i.docs)==null?void 0:p.source}}};const x=["Primary","Secondary"];export{e as Primary,r as Secondary,x as __namedExportsOrder,b as default};
