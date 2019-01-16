package ca.firstvoices.workers;

import ca.firstvoices.property_readers.FV_PropertyValueWithColumnName;
import ca.firstvoices.format_producers.FV_WordCSVProducer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.nuxeo.ecm.core.api.*;
import org.nuxeo.runtime.api.Framework;

import javax.security.auth.login.LoginContext;
import java.util.List;

import static ca.firstvoices.utils.FVExportConstants.ON_DEMAND_WORKER_CATEGORY;

/*
        Worker description is in FVAbstractExportWorker file.
*/

public class FVExportWorker extends FVAbstractExportWork
{
    private static final Log log = LogFactory.getLog(FVExportWorker.class);

    @Override
    public String getCategory() {
        return ON_DEMAND_WORKER_CATEGORY;
    }

    @Override
    public String getTitle() {
        return "Produce formatted document when triggered by user.";
    }

    public FVExportWorker( String id ) { super( id );}

    @Override
    public void work()
    {
        try
        {
            if( !getDocuments().isEmpty() )
            {
                LoginContext lctx = Framework.login();
                CoreSession session = CoreInstance.openCoreSession("default");

                List listToProcess = getDocuments();

                FV_WordCSVProducer fileOutputProducer = new FV_WordCSVProducer(id);
                // write header for CSV files

                fileOutputProducer.writeColumnNames();

                while( !listToProcess.isEmpty() )
                {
                    int size = listToProcess.size();

                    DocumentLocation docLocation = (DocumentLocation) listToProcess.get( size - 1 );
                    listToProcess.remove( size -1 );
                    DocumentModel word = session.getDocument( docLocation.getIdRef() );

                    List<FV_PropertyValueWithColumnName> output = fileOutputProducer.readPropertiesWithReadersFrom( word );

                    fileOutputProducer.writeRowData( output );
                }


                fileOutputProducer.close();
                lctx.logout();
                session.close();
            }
        }
        catch (Exception e) {
            log.warn(e);
        }
    }
}
