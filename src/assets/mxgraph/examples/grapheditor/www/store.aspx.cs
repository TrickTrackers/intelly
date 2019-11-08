using DataLibrary;
using IntelliModule.Library;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Xml;
using System.Web.Script.Serialization;
using System.Threading.Tasks;
 

namespace IntelliModule
{
    public partial class store : System.Web.UI.Page
    {
    
      
        

        protected void Page_Load(object sender, EventArgs e)
        {
            if (Request.QueryString["M"] == "add_xml") 
            {

                var daas = Request.QueryString["xmldata"]; 
                var path=System.Web.Hosting.HostingEnvironment.MapPath("~/XML");

                using (var client = new WebClient())
                { 
    try
    {
        client.DownloadFile(daas,@"D:/test.xml");
    }
    catch (Exception ex)
    {
        while (ex != null)
        {
            Console.WriteLine(ex.Message);
            ex = ex.InnerException;
        }
    }
}
            //    WebClient client = new WebClient();
//string fileString = client.DownloadString(new Uri(daas));
                string ass= Request.QueryString["xmlname"];
                //FileStream fs = File.Create(path + "\\" + Request.QueryString["xmlname"]);
                //XmlDocument xd = new XmlDocument();
                //xd.Load("employees.xml");
                //XmlNode nl = xd.SelectSingleNode("//Employees");
                //XmlDocument xd2 = new XmlDocument();
                //xd2.LoadXml("");
                //XmlNode n = xd.ImportNode(xd2.FirstChild, true);
                //nl.AppendChild(n);
                //xd.Save(Console.Out);
                Page.ClientScript.RegisterStartupScript(this.GetType(), "CallMyFunction", "alert(sessionStorage.getItem('xmla'));", true);
            }

        }


        public class Module_det
        {
            public string mname { get; set; }
            public string mlink { get; set; }
            

        }

        public static string Getaccess_value(string legoid)
        {
            string strRootLv = BindTypes.GetLegoLevel1_treeview(legoid, "0");
            if (strRootLv == "S")
                strRootLv = "P";
            return strRootLv;
        }
        public class board {
            public string name { get; set; }
        }
        [WebMethod]
        public static List<board> get_employee()
        {
            DBAccess _dbacc = new DBAccess();
            var comp = (BindTypes.GetCompanyId("Emp", HttpContext.Current.User.Identity.Name.ToString())).ToString();
            DataSet ds = new DataSet();
            ds = _dbacc.GetDataSet("SELECT * FROM Employee where CompanyId=" + comp);

            List<board> sd = new List<board>();
            foreach (DataRow row in ds.Tables[0].Rows)
            {
                board bo = new board();
                bo.name = row["UserName"].ToString();
                sd.Add(bo);
            }
            return sd;
        }
        [WebMethod]
        public static List<Module_det> get_m_data(string model, string view, string L11)
        {
            ProcessSharkEntities context=new ProcessSharkEntities();
            DBAccess _dacc = new DBAccess();
            DataSet dsS = new DataSet();
            string strQry = "";

            string _PUserName = HttpContext.Current.User.Identity.Name.ToString();
            _dacc = new DBAccess();
            string _Companyid = Convert.ToString(context.Employees.Where(x => x.UserName == _PUserName).Select(y => y.CompanyId).FirstOrDefault());
            string StrSql = _Companyid;
            string strsql1 = model;
            strQry = "exec detailshelpwindow_proc_new '" + StrSql + "','" + strsql1 + "'";
            dsS = _dacc.GetDataSet(strQry);


            List<Module_det> lmd = new List<Module_det>();
            foreach (DataRow row in dsS.Tables[0].Rows)
            {
                Module_det md = new Module_det();
                md.mname = row["LegoName"].ToString() + " ( " + row["LegoId"] + " )";

                string L1 = Getaccess_value(row["LegoId"].ToString());
                string link = "../../../../Account/model.aspx?Mode=O&ModelId=" + row["LegoId"] + "&L1=" + L1 + "&View=" + view + "&TempId=0";
                md.mlink = link;

                lmd.Add(md);
            }	


           // string json = JsonConvert.SerializeObject(dsS, Formatting.Indented);



            return lmd;

        
        }
 
        public static string Date = ""; public static string XMLfile = "";
        public static string lego = ""; public static string htmlfile = "";

        public static async Task run()
        {
            try
            {
                

                var FilePath = System.Web.Hosting.HostingEnvironment.MapPath("~/XML/");
                var FilePath_html = System.Web.Hosting.HostingEnvironment.MapPath("~/XML/HTML");
                XmlDocument doc = new XmlDocument();
                FilePath = FilePath + "/" + lego;
                System.IO.Directory.CreateDirectory(FilePath);               
                File.WriteAllText(FilePath + "/" + Date+".xml", XMLfile);
                File.WriteAllText(FilePath + "/" + Date + ".html", htmlfile);
                //doc.AppendChild(doc.CreateElement(XMLfile));
                //doc.Save(Filesave + "/" + XMLfile);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [WebMethod]
        public static string file_is_exist(string name, string legoid)
        {
              DBAccess _dacc = new DBAccess();
            string query = "select case when(COUNT(*) > 0) then 'false' else 'true' end as result  from connection where Legoid="+legoid+" and connection_name='" + name+"'";
            var data =Convert .ToString(_dacc.GetScalar(query));
            return data;
        }
        [WebMethod]
        public static string Savexml(string XML, string Name,string legoid,string status,string htmlc)
        {
            ProcessSharkEntities context = new ProcessSharkEntities();
            string _PUserName = HttpContext.Current.User.Identity.Name.ToString();
            string _Employeeid = Convert.ToString(context.Employees.Where(x => x.UserName == _PUserName).Select(y => y.EmployeeId).FirstOrDefault());
            string _Companyid = Convert.ToString(context.Employees.Where(x => x.UserName == _PUserName).Select(y => y.CompanyId).FirstOrDefault());
            Date = Name;
            XMLfile = XML;
            lego = legoid;
            htmlfile = htmlc;
            try
            {
                var task = Task.Run((Func<Task>)store.run);
                task.Wait();
                DBAccess _dbacc = new DBAccess();
                if (status == "false")
                {
                    string query = "insert INTO connection(connection_name,legoid,createby,createddate,last_modified,comments,position) VALUES('" + Name + "','" + legoid + "','" + _Employeeid + "','" + DateTime.Now + "','','',(select ISNULL(Max(position)+1,0) as position from connection where legoid=" + legoid + "))";
                    query += "  insert into Tab_Changelog values(" + _Companyid + "," + _Employeeid + "," + legoid + "," + _Employeeid + ",'' ,'Created Diagram(" + Name + ")'," + legoid + ",1,getdate(),'Connections')";
                    _dbacc.ExecuteCommand(query);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            //try
            //{
            //   // string FilePath = "/IntelliModule/XML";
            //    var FilePath = System.Web.Hosting.HostingEnvironment.MapPath("~/XML");

            //    var Filesave = File.Create(FilePath + "/" + Name);
            //    Thread th = Thread.CurrentThread;

            //    XmlDocument doc = new XmlDocument();
            //    doc.AppendChild(doc.CreateElement(XML));
            //    doc.Save(Filesave + "/" + XML);

            //}
            //catch (Exception ex)
            //{

            //    throw ex;
            //}
            return "";
        }
    }
}